import { MapPin, Calendar, Clock, MessageSquare } from "lucide-react"

export default function BookingDetailsPage() {
  return (
    <div className="grid grid-cols-3 gap-6">

      {/* LEFT SIDE */}

      <div className="col-span-2 space-y-6">

        <div>
          <h1 className="text-xl font-semibold">
            Aiden Fernandes
          </h1>

          <p className="text-sm text-gray-500">
            Confirmed booking • Oct 2025 • Aiden Fernandes Birthday Party
          </p>
        </div>


        {/* Event Logistics */}

        <div className="bg-white border rounded-xl p-5">

          <h2 className="font-semibold mb-4">
            Event Logistics
          </h2>

          <div className="grid grid-cols-3 gap-6 text-sm">

            <div>
              <p className="text-gray-500">Event Date</p>
              <p className="font-medium">12 December 2025</p>
            </div>

            <div>
              <p className="text-gray-500">Time</p>
              <p className="font-medium">18:00 - 22:00</p>
            </div>

            <div>
              <p className="text-gray-500">Guest Count</p>
              <p className="font-medium">80 Expected</p>
            </div>

          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16}/>
            Sea Breeze Resort, Miramar, Panaji, Goa
          </div>

          <div className="mt-4 h-40 rounded-lg bg-gray-200 flex items-center justify-center">
            Map Preview
          </div>

        </div>


        {/* Booked Services */}

        <div className="bg-white border rounded-xl p-5">

          <h2 className="font-semibold mb-4">
            Booked Services
          </h2>

          <table className="w-full text-sm">

            <thead className="text-gray-500">
              <tr>
                <th className="text-left py-2">Service Item</th>
                <th>Quantity</th>
                <th className="text-right">Price</th>
              </tr>
            </thead>

            <tbody className="divide-y">

              <tr>
                <td className="py-3">
                  Traditional Goan Buffet
                </td>
                <td className="text-center">80 Guests</td>
                <td className="text-right">₹64,000</td>
              </tr>

              <tr>
                <td className="py-3">
                  Seafood Appetizer Platter
                </td>
                <td className="text-center">20 Plates</td>
                <td className="text-right">₹18,000</td>
              </tr>

              <tr>
                <td className="py-3">
                  Custom Fondant Birthday Cake
                </td>
                <td className="text-center">5kg</td>
                <td className="text-right">₹5,000</td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>


      {/* RIGHT SIDE */}

      <div className="space-y-6">

        {/* Payment Overview */}

        <div className="bg-white border rounded-xl p-5">

          <h2 className="font-semibold mb-4">
            Payment Overview
          </h2>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between">
              <span>Total Budget</span>
              <span>₹45,000</span>
            </div>

            <div className="flex justify-between">
              <span>Paid Amount</span>
              <span className="text-green-600">₹19,000</span>
            </div>

            <div className="flex justify-between">
              <span>Remaining Balance</span>
              <span className="text-orange-600">₹26,000</span>
            </div>

          </div>

        </div>


        {/* Client Profile */}

        <div className="bg-white border rounded-xl p-5">

          <h2 className="font-semibold mb-4">
            Client Profile
          </h2>

          <p className="font-medium">
            Aiden Fernandes
          </p>

          <p className="text-sm text-gray-500">
            +91 9876543210
          </p>

          <p className="text-sm text-gray-500">
            aiden@gmail.com
          </p>

          <button className="mt-4 text-orange-600 text-sm">
            View booking history
          </button>

        </div>


        {/* Quick Actions */}

        <div className="bg-white border rounded-xl p-5 space-y-3">

          <button className="w-full bg-orange-500 text-white py-2 rounded-lg">
            Message Client
          </button>

          <button className="w-full border py-2 rounded-lg">
            Assign Staff
          </button>

          <button className="w-full border py-2 rounded-lg text-red-500">
            Cancel Booking
          </button>

        </div>

      </div>

    </div>
  )
}