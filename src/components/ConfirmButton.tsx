import { useState } from "react";

type ConfirmButtonProps = {
  onConfirm: () => void;
  label?: string;
  confirmLabel?: string;
  ariaLabel?: string;
  className?: string;
};

export function ConfirmButton({
  onConfirm,
  label = "Excluir",
  confirmLabel = "Confirmar exclusão",
  ariaLabel,
  className,
}: ConfirmButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return <button type="button" className={className} aria-label={ariaLabel} onClick={() => setConfirming(true)}>{label}</button>;
  }

  return <span className="confirm-actions">
    <button type="button" className="danger-action" onClick={onConfirm}>{confirmLabel}</button>
    <button type="button" onClick={() => setConfirming(false)}>Cancelar</button>
  </span>;
}
