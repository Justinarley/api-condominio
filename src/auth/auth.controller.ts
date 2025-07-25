import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginAdminDto } from './dto/login.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginAdminDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    )
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }
    return this.authService.login(user)
  }
}
