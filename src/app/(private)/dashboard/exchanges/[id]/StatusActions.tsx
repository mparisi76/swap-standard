"use client";

import { useActionState } from "react";
import { updateExchangeStatusAction, type UpdateStatusState } from "@/app/actions/exchanges/update-status";
import { type Exchange, type ExchangeStatus } from "@/types/schema";
import { Loader } from "lucide-react";

const STATUS_LABEL: Record<ExchangeStatus, string> = {
  pending:   "Pending Acceptance",
  active:    "In Progress",
  completed: "Completed",
  declined:  "Declined",
  cancelled: "Cancelled",
};

const STATUS_COLOUR: Record<ExchangeStatus, string> = {
  pending:   "text-amber-600 border-amber-600",
  active:    "text-emerald-700 border-emerald-700",
  completed: "text-zinc-500 border-zinc-300",
  declined:  "text-zinc-500 border-zinc-200",
  cancelled: "text-zinc-500 border-zinc-200",
};

export default function StatusActions({
  exchange,
  currentUserId,
}: {
  exchange: Exchange;
  currentUserId: string;
}) {
  const ownerId = typeof exchange.owner === "string" ? exchange.owner : exchange.owner?.id;
  const initiatorId = typeof exchange.initiator === "string" ? exchange.initiator : exchange.initiator?.id;
  const isOwner = ownerId === currentUserId;
  const isInitiator = initiatorId === currentUserId;
  const { status, id: exchangeId } = exchange;

  const acceptAction = updateExchangeStatusAction.bind(null, exchangeId, "active");
  const declineAction = updateExchangeStatusAction.bind(null, exchangeId, "declined");
  const completeAction = updateExchangeStatusAction.bind(null, exchangeId, "completed");
  const cancelAction = updateExchangeStatusAction.bind(null, exchangeId, "cancelled");

  const [acceptState, acceptDispatch, acceptPending] = useActionState<UpdateStatusState, FormData>(acceptAction, null);
  const [declineState, declineDispatch, declinePending] = useActionState<UpdateStatusState, FormData>(declineAction, null);
  const [completeState, completeDispatch, completePending] = useActionState<UpdateStatusState, FormData>(completeAction, null);
  const [cancelState, cancelDispatch, cancelPending] = useActionState<UpdateStatusState, FormData>(cancelAction, null);

  const anyPending = acceptPending || declinePending || completePending || cancelPending;
  const error = acceptState?.error ?? declineState?.error ?? completeState?.error ?? cancelState?.error;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className={`inline-flex items-center border-2 px-4 py-2 ${STATUS_COLOUR[status]}`}>
          <span className="text-label font-black uppercase tracking-widest">
            {STATUS_LABEL[status]}
          </span>
        </div>

        {status === "pending" && isOwner && (
          <div className="flex items-center gap-3">
            <form action={acceptDispatch}>
              <button
                type="submit"
                disabled={anyPending}
                className="text-label font-black uppercase tracking-widest px-6 py-2 bg-zinc-900 text-white border-2 border-zinc-900 hover:bg-emerald-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {acceptPending ? <Loader size={13} className="animate-spin" /> : "Accept"}
              </button>
            </form>
            <form action={declineDispatch}>
              <button
                type="submit"
                disabled={anyPending}
                className="text-label font-black uppercase tracking-widest px-6 py-2 bg-white text-zinc-900 border-2 border-zinc-900 hover:bg-zinc-100 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {declinePending ? <Loader size={13} className="animate-spin" /> : "Decline"}
              </button>
            </form>
          </div>
        )}

        {status === "active" && (isOwner || isInitiator) && (
          <div className="flex items-center gap-3">
            <form action={completeDispatch}>
              <button
                type="submit"
                disabled={anyPending}
                className="text-label font-black uppercase tracking-widest px-6 py-2 bg-zinc-900 text-white border-2 border-zinc-900 hover:bg-emerald-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {completePending ? <Loader size={13} className="animate-spin" /> : "Mark Complete"}
              </button>
            </form>
            <form action={cancelDispatch}>
              <button
                type="submit"
                disabled={anyPending}
                className="text-label font-black uppercase tracking-widest px-6 py-2 bg-white text-zinc-900 border-2 border-zinc-900 hover:bg-zinc-100 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {cancelPending ? <Loader size={13} className="animate-spin" /> : "Cancel"}
              </button>
            </form>
          </div>
        )}
      </div>

      {error && (
        <p className="text-label font-bold text-red-600 uppercase">{error}</p>
      )}
    </div>
  );
}
