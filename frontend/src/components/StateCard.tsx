type Props = {
  title: string
  message: string
}

export const StateCard = ({ title, message }: Props) => (
  <div className="rounded-lg border bg-white p-4">
    <h3 className="font-semibold">{title}</h3>
    <p className="mt-2 text-sm text-slate-600">{message}</p>
  </div>
)
