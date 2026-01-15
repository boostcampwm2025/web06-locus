import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        node: configService.get<string>(
          'ELASTICSEARCH_NODE',
          'http://localhost:9200',
        ),
        auth: {
          username: configService.get<string>(
            'ELASTICSEARCH_USERNAME',
            'elastic',
          ),
          password: configService.get<string>(
            'ELASTICSEARCH_PASSWORD',
            'password',
          ),
        },
        maxRetries: 10,
        requestTimeout: 60000,
        sniffOnStart: false,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [ElasticsearchModule],
})
export class ElasticsearchConfigModule {}
