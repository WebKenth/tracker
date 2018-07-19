<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    //
    public $casts = [
    	'client' => 'object',
    	'data' => 'object',
    	'element' => 'object'
    ];

    public function session()
    {
    	return $this->belongsTo(App\Session::class);
    }
}
