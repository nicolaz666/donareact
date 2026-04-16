export default function ResponsiveTable({ desktop, mobile }) {
  return (
    <>
      <div className="hidden md:block">{desktop}</div>
      <div className="md:hidden">{mobile}</div>
    </>
  )
}

