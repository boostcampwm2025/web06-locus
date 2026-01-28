import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MapsService } from './maps.service';
import { GeocodeRequestDto } from './dto/geocode.request.dto';
import { GeocodeResponseDto } from './dto/geocode.response.dto';
import { ReverseGeocodeRequestDto } from './dto/reverse-geocode.request.dto';
import { ReverseGeocodeResponseDto } from './dto/reverse-geocode.response.dto';
import { JwtAuthGuard } from '@/jwt/guard/jwt.auth.guard';
import { GeocodeSwagger, ReverseGeocodeSwagger } from './swagger/maps.swagger';

@ApiTags('maps')
@Controller('maps')
export class MapsController {
  constructor(private readonly MapsService: MapsService) {}

  @UseGuards(JwtAuthGuard)
  @GeocodeSwagger()
  @Get('geocode')
  async getCoordinates(
    @Query() requestDto: GeocodeRequestDto,
  ): Promise<GeocodeResponseDto> {
    const result = await this.MapsService.getCoordinatesFromAddress(
      requestDto.address,
    );

    const response = {
      meta: result.meta,
      addresses: result.addresses.map((addr) => ({
        roadAddress: addr.roadAddress,
        jibunAddress: addr.jibunAddress,
        englishAddress: addr.englishAddress,
        latitude: addr.y,
        longitude: addr.x,
      })),
    };

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @ReverseGeocodeSwagger()
  @Get('reverse-geocode')
  async getAddress(
    @Query() requestDto: ReverseGeocodeRequestDto,
  ): Promise<ReverseGeocodeResponseDto> {
    return this.MapsService.getAddressFromCoordinates(
      requestDto.latitude,
      requestDto.longitude,
    );
  }
}
