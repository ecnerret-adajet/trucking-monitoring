<?php

namespace App\Http\Requests;

use App\Http\Requests\Request;
use App\Truck;

class TruckRequest extends Request
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(Truck $truck)
    {
            return [
            'operator' => 'required',
            'driver_list' => 'required',
            'assignment_list' => 'required',
            'plate_no' => 'required|min:6|unique:trucks,plate_no'. $truck->plate_no
         ];
    }
}
