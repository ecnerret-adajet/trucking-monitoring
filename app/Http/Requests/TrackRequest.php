<?php

namespace App\Http\Requests;

use App\Http\Requests\Request;

class TrackRequest extends Request
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
    public function rules()
    {
          return [
            'truck_list' => 'required',
            'customer_list' => 'required'
        ];
    }
    public function messages()
    {
        return [
            
            'customer_list.required' => 'This field is required',
            'truck_list.required' => 'This field is required'
        ];
    }
}
