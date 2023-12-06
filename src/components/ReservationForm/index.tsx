import Button from "../Button";
import Input from "../Input";
import Select from "../Select";

export default function ReservationForm() {
  return (
    <form className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-md bg-white p-6 sm:grid-cols-6">
      <div className="sm:col-span-1">
        <div className="mt-2">
          <Input name="name" placeholder="Your name" />
        </div>
      </div>

      <div className="sm:col-span-2">
        <div className="mt-2">
          <Select name="from">
            <option>hi</option>
          </Select>
        </div>
      </div>

      <div className="sm:col-span-2">
        <div className="mt-2">
          <Select name="to">
            <option>hi</option>
          </Select>
        </div>
      </div>

      <div className="sm:col-span-1">
        <div className="mt-2">
          <Button type="submit">Reserve</Button>
        </div>
      </div>
    </form>
  );
}
