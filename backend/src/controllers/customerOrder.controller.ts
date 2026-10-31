import type { Request, Response } from "express";
import {
  getOrderDetailForUser,
  listOrdersForUser,
} from "../services/customerOrder.service.js";
import { requestRefundAsCustomer } from "../services/refund.service.js";
import { toCustomerListItem } from "../utils/toCustomerOrderDto.js";
import { toCustomerRefundDto } from "../utils/toRefundDto.js";
import type { MyOrdersQuery } from "../validators/customerOrder.validator.js";

export const listMyOrdersHandler = async (req: Request, res: Response) => {
  const query = res.locals.query as MyOrdersQuery;
  const { orders, total } = await listOrdersForUser(req.appUser!, query);
  res.status(200).json({
    data: orders.map(toCustomerListItem),
    meta: { page: query.page, limit: query.limit, total },
  });
};

export const getMyOrderHandler = async (req: Request, res: Response) => {
  const detail = await getOrderDetailForUser(
    req.appUser!,
    String(req.params.reference),
  );
  res.status(200).json({ data: detail });
};

export const requestRefundHandler = async (req: Request, res: Response) => {
  const refund = await requestRefundAsCustomer(
    req.appUser!,
    String(req.params.reference),
    req.body,
    String(req.id),
  );
  res.status(201).json({ data: toCustomerRefundDto(refund) });
};
