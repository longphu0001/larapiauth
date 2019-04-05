<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class RoleType extends Enum
{
  const ADMINISTRATOR = 'admin';
  const MODERATOR = 'mod';
  const MEMBER = 'member';
}
