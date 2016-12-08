<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Truck;
use App\Track;
use App\Customer;
use DB;
use Carbon\Carbon;
use Mail;

class Emergency extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'emergency';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send Test email';

        protected $track;

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct(Track $track)
    {
        parent::__construct();

        $this->track =$track;
    }



    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
    // set the necessary data for email notification
    // $find_tracks = Track::findOrFail(504);
    $num = '09175699879';
    $tracks = Track::where('id', 504)->get();

    // send an emergency email to line manager.
     Mail::send('email.emergency', ['tracks' => $tracks, 'num' => $num], function($message) use ($tracks) {
     $message->to('tejada.terrence@gmail.com', 'Trucking Monitoring')
              ->subject('Emergency Email');
     $message->from('trucking@trucking.com','Trucking Monitoring Report');
    });
    }
}
