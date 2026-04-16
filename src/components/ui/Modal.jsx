import { Dialog } from "primereact/dialog"

export default function Modal({
  visible,
  onHide,
  header,
  children,
  breakpoints,
  style,
  contentStyle,
}) {
  return (
    <Dialog
      header={header}
      visible={visible}
      onHide={onHide}
      breakpoints={breakpoints}
      style={style}
      contentStyle={contentStyle}
      modal
      dismissableMask
    >
      {children}
    </Dialog>
  )
}

