<?php

namespace App\Console\Commands;

use Mail;
use Excel;
use App\Track;
use Carbon\Carbon;
use DB;
use Illuminate\Console\Command;

class Report extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'report';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send daily email report to admin';

    protected $track;

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct(Track $track)
    {
        parent::__construct();

        $this->track = $track;
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {

        $tracks = Track::latest('created_at')->where('created_at', '>=' ,Carbon::now()->subDays(1))->get();
       
       $plantin = Track::latest('created_at')
                ->where('created_at', '>=' ,Carbon::now()->subDays(1))
                ->where('entry_plant', '!=', '0000-00-00 00:00:00')
                ->get();

       $plantout = Track::latest('created_at')
                ->where('created_at', '>=' ,Carbon::now()->subDays(1))
                ->where('out_plant', '!=', '0000-00-00 00:00:00')
                ->get();

       $customerin = Track::latest('created_at')
                ->where('created_at', '>=' ,Carbon::now()->subDays(1))
                ->where('in_customer', '!=', '0000-00-00 00:00:00')
                ->get();   

       $customerout = Track::latest('created_at')
                ->where('created_at', '>=' ,Carbon::now()->subDays(1))
                ->where('out_customer', '!=', '0000-00-00 00:00:00')
                ->get();    

        $data = [
                'name' => 'Admin',
                'total_track' => $tracks->count(),
                'total_plantin' => $plantin->count(),
                'total_plantout' => $plantout->count(),
                'total_customerin' => $customerin->count(),
                'total_customerout' => $customerout->count(),
        ];


        // $tracks_export = Track::select('dispatch','out_plant','in_customer','out_customer')
        //                         ->where('dispatch', '>=' ,Carbon::now()->subDays(1))->get();


        Excel::create('tracks_export'.Carbon::now()->format('Ymdh'), function($excel) {

            $excel->sheet('Sheet1', function($sheet) {
                $tracks_exports = Track::latest('created_at')->where('created_at', '>=' ,Carbon::now()->subDays(1))->get();
                $count_track = $tracks_exports->count();

                $arr =array();
                foreach($tracks_exports as $tracks_export) {
                    foreach($tracks_export->trucks as $truck){
                        $data =  array(
                            $truck->plate_no, 
                            $tracks_export->dispatch, 
                            $tracks_export->out_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'N/A' : $tracks_export->out_plant->format('h:i:s A'), 
                            $tracks_export->in_customer->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'N/A' : $tracks_export->in_customer->format('h:i:s A'), 
                            $tracks_export->out_customer->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'N/A' : $tracks_export->out_customer->format('h:i:s A'), 
                            $tracks_export->back_plant->format('Y-m-d h:i:s A')  == '-0001-11-30 12:00:00 AM' ? 'N/A' : $tracks_export->back_plant->format('h:i:s A'));
                        array_push($arr, $data);
                    }
                    
                }

                //set the titles
                $sheet->fromArray($arr,null,'A1',false,false)
                        ->setBorder('A1:F'.$count_track,'thin')
                        ->prependRow(array(
                        'PLATE NUMBER', 'PLANT IN', 'PLANT OUT', 'CUSTOMER IN', 'CUSTOMER OUT',
                        'BACK PLANT'));
                $sheet->cells('A1:F1', function($cells) {
                         $cells->setBackground('#f1c40f'); 
                });

            });

        })->store('xls', storage_path('email'));



         Mail::send('email.report', $data, function($message) {
         $message->to('tejada.terrence@gmail.com', 'Trucking Monitoring')
                  ->subject('Trucking Monitoring Report');
         $message->attach('C:\xampp\htdocs\trucking-monitoring\storage\email\tracks_export'.Carbon::now()->format('Ymdh').'.xls');
         $message->from('admin@trucking.com','Trucking Monitoring Report');
        });


    }
}
