import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class JoinATeamDto {
  @IsString()
  @IsNotEmpty()
  RunnerUID: string;

  @IsNumber()
  @IsNotEmpty()
  OrgID: number;
}

