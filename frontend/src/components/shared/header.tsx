import { BellIcon, SchoolIcon } from "lucide-react"


export function Header() {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center py-8 gap-3">
      <div className="flex items-center justify-center font-semibold text-lg">
        <BellIcon size={20} className="mr-2" /> Notify
      </div>
      <div className="flex items-center justify-center font-semibold text-lg">
        <SchoolIcon size={20} className="mr-2" /> For Ontario Tech University
      </div>
    </header>
  )
}