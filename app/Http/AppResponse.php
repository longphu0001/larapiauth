<?php

namespace App\Http;

use Symfony\Component\HttpFoundation\Response as Response;

class AppResponse extends Response
{
    const STATUS_SUCCESS = true;
    const STATUS_FAILURE = false;
}
