import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MapsService } from './maps.service';
import { AddressSearchRequestDto } from './dto/address-search.request.dto';
import { GeocodeResponseDto } from './dto/geocode.response.dto';
import { SearchAddressResponseDto } from './dto/search-address.response.dto';
import { ReverseGeocodeRequestDto } from './dto/reverse-geocode.request.dto';
import { ReverseGeocodeResponseDto } from './dto/reverse-geocode.response.dto';
import { JwtAuthGuard } from '@/jwt/guard/jwt.auth.guard';
import {
  GeocodeSwagger,
  ReverseGeocodeSwagger,
  SearchAddressSwagger,
} from './swagger/maps.swagger';

@ApiTags('maps')
@Controller('maps')
export class MapsController {
  constructor(private readonly MapsService: MapsService) {}

  @UseGuards(JwtAuthGuard)
  @GeocodeSwagger()
  @Get('geocode')
  async getCoordinates(
    @Query() requestDto: AddressSearchRequestDto,
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

  @UseGuards(JwtAuthGuard)
  @Get()
  @SearchAddressSwagger()
  async searchAddress(
    @Query() requestDto: AddressSearchRequestDto,
  ): Promise<SearchAddressResponseDto> {
    return this.MapsService.searchAddress(requestDto.address);
  }
}
