<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEventsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('events', function (Blueprint $table) {
            $table->increments('id');
            $table->uuid('key');
            $table->string('type')->index();
            $table->string('eventType')->index();
            $table->string('url')->index();
            $table->float('timestamp', 64, 10)->index();
            $table->jsonb('data');
            $table->jsonb('element');
            $table->jsonb('client');
            $table->timestamps();

            $table->foreign('key')
                  ->references('key')
                  ->on('sessions');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('events');
    }
}
