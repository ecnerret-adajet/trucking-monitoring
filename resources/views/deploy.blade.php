<!-- modal create new assignee form -->
 
 <div class="modal fade bs-example-modal-lg"  role="dialog" aria-labelledby="myLargeModalLabel">
   <div class="modal-dialog">
     <div class="modal-content">
       <div class="modal-header">
         <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
         <h4 class="modal-title text-uppercase">Add Truck list</h4>
       </div>
       <div class="modal-body">
               <div class="row">
         <div class="col-md-12">
                 <div class="panel-body">  
     {!! Form::model($track = new \App\Track,  ['class' => 'form-horizontal bootstrap-modal-form',  'url' => 'tracks',  'files' => 'true', 'enctype'=>'multipart/form-data', 'novalidate' => 'novalidate', 'id' => 'assetinventoryForm'])!!}
     {!! csrf_field() !!}
                     
                     
            @include('tracks.form')
                 </div>
         </div>
     </div>
       </div>
       <div class="modal-footer">
         <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
           
     {!! Form::submit('Submit', ['class' => 'btn btn-primary'])  !!}              
       </div>
     {!! Form::close() !!}
     </div><!-- /.modal-content -->
   </div><!-- /.modal-dialog -->
 </div><!-- /.modal -->

 <!-- end add track modal -->