<?php

namespace App\Console\Commands;

use Mail;
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
    protected $description = 'Send drip e-mail to a user';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();

    }

    /** 
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        // $this->drip->send(User::find($this->argument('user')));

         $data = array('name'=>"Admin");
         Mail::send('emails.report', $data, function($message) {
         $message->to('admin@lafilgroup.com', 'Trucking Monitoring')
                  ->subject('Trucking Monitoring Report');
         $message->from('trucking@trucking.com','Terrence Tejada');
      });
    }
}
