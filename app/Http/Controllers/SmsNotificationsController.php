<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Truck;
use App\Track;
use App\Customer;
use DB;
use Carbon\Carbon;
use Mail;

class SmsNotificationsController extends Controller
{
    public function sms(Request $request, Track $track)
    {
        // get from SMS gateway API
        $num = $request->num;
        $post = $request->port;
        $message = $request->message;
        $time = $request->time;

        // filter and remove the coded messages 
        $message_to_lower = strtolower($message); // force to convert text to lowercase 

        $code_messages = [
            'plant_in' => 'plant-in-',
            'plant_out' => 'plant-out-',
            'customer_in' => 'customer-in-',
            'customer_out' => 'customer-out-',
            'back_to_plant' => 'back-plant-',
            'help' => 'help-'
        ];

        // String manipulate the text message
        $text = strtolower(str_replace(' ', '-', $message_to_lower));// plant-in-aaa-000 and eliminate excess spaces
        $x = str_replace($code_messages, '', $text); // aaa-000   
        $y = str_replace('-', ' ', strtoupper($x)); //AAA 000   


         //find the texted plate no is exist on tracks dispatch
        $find_id = Track::latest('created_at')
        ->whereHas('trucks', function($q) use ($y){
            $q->where('plate_no', $y);
        })
        ->where('created_at', '>=' ,Carbon::now()->subDays(2))
        ->take(1)
        ->get();
    
        if (count($find_id)) {
            foreach($find_id as $find_id_pass){ 
                $z = $find_id_pass->id;
                         //filter text message then send then return result via sms.
                        // should return plant-in-aaa-000
                        if(str_is('plant in*', $message_to_lower)){

                                    // update the entry plant with current date and time
                                    $track = Track::find($z);
                                    $track->entry_plant = Carbon::now()->setTimezone('Asia/Manila');
                                    $track->save();

                                     //sending sms to driver 
                                    $container =urlencode(mb_convert_encoding("Truck successfully 'plant in'", 'utf-8', 'gb2312'));  
                                    // create a new cURL resource
                                    $ch = curl_init();
                                    // set URL and other appropriate options
                                    curl_setopt($ch, CURLOPT_URL, "http://10.96.2.20:80/sendsms?username=admin&password=P@ssw0rd123&phonenumber=$num&message=$container");
                                    curl_setopt($ch, CURLOPT_HEADER, 0);
                                    curl_exec($ch);
                                    curl_close($ch);
                        
                              
                        } 

                        elseif(str_is('plant out*', $message_to_lower)){

                                    // update the entry plant with current date and time
                                    $track = Track::find($z);
                                    $track->out_plant = Carbon::now()->setTimezone('Asia/Manila');
                                    $track->save();

                                     //sending sms to driver 
                                    $container =urlencode(mb_convert_encoding("Truck successfully 'plant out'", 'utf-8', 'gb2312'));  
                                    // create a new cURL resource
                                    $ch = curl_init();
                                    // set URL and other appropriate options
                                    curl_setopt($ch, CURLOPT_URL, "http://10.96.2.20:80/sendsms?username=admin&password=P@ssw0rd123&phonenumber=$num&message=$container");
                                    curl_setopt($ch, CURLOPT_HEADER, 0);
                                    curl_exec($ch);
                                    curl_close($ch);
                        
                              
                        }

                        elseif(str_is('customer in*', $message_to_lower)){

                                    // update the entry plant with current date and time
                                    $track = Track::find($z);
                                    $track->in_customer = Carbon::now()->setTimezone('Asia/Manila');
                                    $track->save();

                                     //sending sms to driver 
                                    $container =urlencode(mb_convert_encoding("Truck successfully 'customer in'", 'utf-8', 'gb2312'));  
                                    // create a new cURL resource
                                    $ch = curl_init();
                                    // set URL and other appropriate options
                                    curl_setopt($ch, CURLOPT_URL, "http://10.96.2.20:80/sendsms?username=admin&password=P@ssw0rd123&phonenumber=$num&message=$container");
                                    curl_setopt($ch, CURLOPT_HEADER, 0);
                                    curl_exec($ch);
                                    curl_close($ch);

                        
                              
                        }

                        elseif(str_is('customer out*', $message_to_lower)){

                                    // update the entry plant with current date and time
                                    $track = Track::find($z);
                                    $track->out_customer = Carbon::now()->setTimezone('Asia/Manila');
                                    $track->save();

                                     //sending sms to driver 
                                    $container =urlencode(mb_convert_encoding("Truck successfully 'customer out'", 'utf-8', 'gb2312'));  
                                    // create a new cURL resource
                                    $ch = curl_init();
                                    // set URL and other appropriate options
                                    curl_setopt($ch, CURLOPT_URL, "http://10.96.2.20:80/sendsms?username=admin&password=P@ssw0rd123&phonenumber=$num&message=$container");
                                    curl_setopt($ch, CURLOPT_HEADER, 0);
                                    curl_exec($ch);
                                    curl_close($ch);
                              
                        }

                         elseif(str_is('back plant*', $message_to_lower)){

                                    // update the entry plant with current date and time
                                    $track = Track::find($z);
                                    $track->back_plant = Carbon::now()->setTimezone('Asia/Manila');
                                    $track->save();

                                    foreach($track->trucks as $truck){
                                        $back_id = $truck->id;
                                    }

                                    $truck = Truck::findOrFail($back_id);
                                    $truck->availability = 0;
                                    $truck->save();

                                     //sending sms to driver 
                                    $container =urlencode(mb_convert_encoding("Truck successfully 'back to plant'", 'utf-8', 'gb2312'));  
                                    // create a new cURL resource
                                    $ch = curl_init();
                                    // set URL and other appropriate options
                                    curl_setopt($ch, CURLOPT_URL, "http://10.96.2.20:80/sendsms?username=admin&password=P@ssw0rd123&phonenumber=$num&message=$container");
                                    curl_setopt($ch, CURLOPT_HEADER, 0);
                                    curl_exec($ch);
                                    curl_close($ch);
                              
                        }


                        elseif(str_is('help*', $message_to_lower)){

                                    // update the entry plant with current date and time
                                    $track = Track::find($z);
                                    $track->help = 1;
                                    $track->save();

                                    // find the texter's hauler that will be pass to email notification
                                     $tracks = Track::where('id', $z)->get();

                                    // send an emergency email to line manager.
                                     Mail::send('email.emergency', ['tracks' => $tracks, 'num' => $num], function($message) use ($tracks) {
                                     $message->to('albin.bravo@amigologisticscorp.com', 'Trucking Monitoring')
                                              ->cc('tejada.terrence@gmail.com', 'Trucking Monitoring')
                                              ->subject('Emergency Email');
                                     $message->from('trucking@trucking.com','Trucking Monitoring Report');
                                    });

                                     //sending sms to driver 
                                    $container =urlencode(mb_convert_encoding("Alert: This is to corfirm that you activated the emergency code, please be attentive to your phone. any moment an personnel will call you.", 'utf-8', 'gb2312'));  
                                    // create a new cURL resource
                                    $ch = curl_init();
                                    // set URL and other appropriate options
                                    curl_setopt($ch, CURLOPT_URL, "http://10.96.2.20:80/sendsms?username=admin&password=P@ssw0rd123&phonenumber=$num&message=$container");
                                    curl_setopt($ch, CURLOPT_HEADER, 0);
                                    curl_exec($ch);
                                    curl_close($ch);

                        
                              
                        }

                         else {
                                    //sending sms to driver 
                                    $container =urlencode(mb_convert_encoding("Trucking Monitoring: Invalid input please try again", 'utf-8', 'gb2312'));  
                                    // create a new cURL resource
                                    $ch = curl_init();
                                    // set URL and other appropriate options
                                    curl_setopt($ch, CURLOPT_URL, "http://10.96.2.20:80/sendsms?username=admin&password=P@ssw0rd123&phonenumber=$num&message=$container");
                                    curl_setopt($ch, CURLOPT_HEADER, 0);
                                    curl_exec($ch);
                                    curl_close($ch);
                        }   // end send message foreach   
            }  // end find_id foreach
        }else{

             //sending sms to driver 
            $container =urlencode(mb_convert_encoding("Trucking Monitoring: No plate number found from dispatch trucks or invalid format. kindly coordinate with your dispatcher.", 'utf-8', 'gb2312'));  
            // create a new cURL resource
            $ch = curl_init();
            // set URL and other appropriate options
            curl_setopt($ch, CURLOPT_URL, "http://10.96.2.20:80/sendsms?username=admin&password=P@ssw0rd123&phonenumber=$num&message=$container");
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_exec($ch);
            curl_close($ch);

        }


 




 


  
    
    }
}
