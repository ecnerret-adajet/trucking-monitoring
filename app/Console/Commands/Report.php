<?php

namespace App\Console\Commands;

use Mail;
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

         Mail::send('email.report', $data, function($message) {
         $message->to('donna.pasquin@lafilgroup.com', 'Trucking Monitoring')
                  ->subject('Trucking Monitoring Report');
         $message->from('admin@trucking.com','Trucking Monitoring Report');
      });
    }
}
