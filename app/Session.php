<?php

namespace App;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    //

    public $casts = [
    	'client' => 'object'
    ];

    public function events()
    {
    	return $this->hasMany(App\Event::class);
    }

    public function generateKey($depth = 0)
    {
    	$key = (string) Str::uuid();
    	$results = $this->where('key',$key)->get();
    	if(count($results) > 0)
    		return $this->generateKey($depth++);
    	else if ($depth == 10)
    		throw new Exception('Generation of Guid failed, too many attempts');
    	return $key;
    }
}
