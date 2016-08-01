<?php

namespace App\Http\Requests;

use App\Http\Requests\Request;

class CustomerRequest extends Request
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
            'customer_name' = > 'required',
            'destination' => 'required'
        ];
    }

    public function messages()
    {
        return[
        'customer_name.required' = > 'This field is required',
        'destination.required' => 'This field is required'
        ];
    }
}
