import type { Request, RequestHandler, Response } from "express";
import type { OrderAction } from "../constants/orderTransitions.js";
import {
  getAdminOrderDetail,
  getOrderSummary,
  listAdminOrders,
} from "../services/adminOrder.service.js";
import type { Actor, TransitionInput } from "../services/orderStateMachine.js";
import { applyTransition } from "../services/orderTransition.service.js";
import { nprToPaisa } from "../utils/money.js";
import type {
  CompleteBody,
  ConfirmPaymentBody,
  ListOrdersQuery,
  NoteBody,
  ReassignBody,
  ReasonBody,
  ReopenBody,
} from "../validators/adminOrder.validator.js";
import { revealOrderPassword } from "../services/credential.service.js";
import { getContext } from "../utils/requestContext.js";

const actorOf = (req: Request): Actor => ({
  type: "admin",
  userId: String(req.appUser!._id),
  role: req.appUser!.role as "operator" | "owner",
});

const act =
  <TBody>(
    action: OrderAction,
    toInput: (body: TBody) => TransitionInput,
  ): RequestHandler =>
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await applyTransition({
      orderId: id,
      action,
      actor: actorOf(req),
      input: toInput(req.body as TBody),
      requestId: String(req.id),
    });
    const detail = await getAdminOrderDetail(req.appUser!, id);
    res.status(200).json({ data: detail });
  };

export const listOrdersHandler = async (req: Request, res: Response) => {
  const query = res.locals.query as ListOrdersQuery;
  const { orders, total } = await listAdminOrders(req.appUser!, query);
  res.status(200).json({
    data: orders,
    meta: { page: query.page, limit: query.limit, total },
  });
};

export const orderSummaryHandler = async (_req: Request, res: Response) => {
  res.status(200).json({ data: await getOrderSummary() });
};

export const getOrderDetailHandler = async (req: Request, res: Response) => {
  res.status(200).json({
    data: await getAdminOrderDetail(req.appUser!, String(req.params.id)),
  });
};

export const confirmPaymentHandler = act<ConfirmPaymentBody>(
  "confirmPayment",
  (body) => ({
    payments: body.payments.map((payment) => ({
      esewaTxnId: payment.esewaTxnId,
      amountPaisa: nprToPaisa(payment.amountNpr),
    })),
    excessAcknowledged: body.excessAcknowledged,
  }),
);

export const rejectPaymentHandler = act<ReasonBody>(
  "rejectPayment",
  (body) => ({ reason: body.reason }),
);
export const holdHandler = act<ReasonBody>("hold", (body) => ({
  reason: body.reason,
}));
export const releaseHoldHandler = act<NoteBody>("releaseHold", (body) => ({
  note: body.note,
}));
export const completeHandler = act<CompleteBody>("complete", (body) => ({
  seenPlayerName: body.seenPlayerName,
}));
export const failHandler = act<ReasonBody>("fail", (body) => ({
  reason: body.reason,
}));
export const retryHandler = act<NoteBody>("retry", (body) => ({
  note: body.note,
}));
export const cancelHandler = act<ReasonBody>("cancelByAdmin", (body) => ({
  reason: body.reason,
}));
export const reassignHandler = act<ReassignBody>("reassignClaim", (body) => ({
  claimantId: body.claimantId,
}));
export const reopenHandler = act<ReopenBody>("reopen", (body) => ({
  reason: body.reason,
  claimantId: body.claimantId,
}));

export const revealPasswordHandler = async (req: Request, res: Response) => {
  const password = await revealOrderPassword(
    getContext(req),
    String(req.params.id),
  );
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ data: { password } });
};
