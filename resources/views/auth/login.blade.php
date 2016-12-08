<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">

    <title>Trucking Monitoring</title>

    <!-- Fonts -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css" integrity="sha384-XdYbMnZ/QjLh6iI4ogqCTaIjrFk87ip+ekIjefZch0Y+PvJ8CDYtEs1ipDmPorQ+" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css?family=Miriam+Libre:400,700" rel="stylesheet">

     <!-- Ionicons 2.0.0 -->
    <link href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css" rel="stylesheet" type="text/css" />

     <!-- theme bootstrap -->

     <link rel="stylesheet" href="{{asset('css/bootstrap.min.css')}}">
     <link rel="stylesheet" href="{{asset('css/style.css')}}">

    <style>
        html{
            height: 100%;

        }
        body {
           font-family: 'Miriam Libre', sans-serif;
           background-color: #ecf0f1;
           height: 100%;
           

            overflow-x: hidden;

        }

        h1, h2, h3, h4, h5, h6{
            font-family: 'Miriam Libre', sans-serif;
        }

        .login_bg{
         background: url('../public/img/web/truck-bg.jpg') no-repeat center center fixed;  
         background-size: cover; 
         color: #fff;
         padding: 100px;
         
        }

        .row {
            height: 100% ! important;
            min-width: 100%;
            display: table;
          
        }

        .row .no-float {
          display: table-cell;
          float: none;

        }

        .fa-btn {
            margin-right: 6px;
        }
    </style>
  

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
        <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
</head>
   
 <body>



    <div class="row">
        <div class="col-md-4 no-float" style="padding: 100px 50px 50px 50px;">
       
            <span class="logo-front">
            <img class="img-responsive" src="{{asset('img/web/delivery-truck.png')}}" style=" display: inline-block; height: 50px; width: auto;">
            Trucking Monitoring
            </span>

            <div class="panel panel-primary" style="margin-top: 20px;">
                <div class="panel-heading">Login</div>
                <div class="panel-body">
                    <form class="form-horizontal" role="form" method="POST" action="{{ url('/login') }}">
                        {{ csrf_field() }}

                        <div class="form-group{{ $errors->has('email') ? ' has-error' : '' }}">
                            <label for="email" class="col-md-4 control-label">E-Mail Address</label>

                            <div class="col-md-8">
                                <input id="email" type="email" class="form-control" name="email" placeholder="example@email.com" value="{{ old('email') }}">

                                @if ($errors->has('email'))
                                    <span class="help-block">
                                        <strong>{{ $errors->first('email') }}</strong>
                                    </span>
                                @endif
                            </div>
                        </div>

                        <div class="form-group{{ $errors->has('password') ? ' has-error' : '' }}">
                            <label for="password" class="col-md-4 control-label">Password</label>

                            <div class="col-md-8">
                                <input id="password" type="password" class="form-control" name="password">

                                @if ($errors->has('password'))
                                    <span class="help-block">
                                        <strong>{{ $errors->first('password') }}</strong>
                                    </span>
                                @endif
                            </div>
                        </div>


                        <div class="form-group">
                            <div class="col-md-6 col-md-offset-4">
                                <button type="submit" class="btn btn-block btn-primary">
                                    <i class="fa fa-btn fa-sign-in"></i> Login
                                </button>

                            </div>
                        </div>
                    </form>
                </div>
            </div>

           
        </div>

        <div class="col-md-8 no-float login_bg">
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
       
                 <em>
                 <h2>
                {{ Illuminate\Foundation\Inspiring::quote() }}
                </h2>
                  </em>
            
        </div>
          

         </div>



 <!-- JavaScripts -->
   <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.3/jquery.min.js" integrity="sha384-I6F5OKECLVtK/BL+8iSLDEHowSAfUo76ZL9+kGAgTRdiByINKJaqTPH/QVNS1VDb" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>

</body>
</html>
