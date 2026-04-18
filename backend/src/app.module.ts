import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CollectionPointsModule } from './collection-points/collection-points.module';
import { RecyclingRequestsModule } from './recycling-requests/recycling-requests.module';
import { UploadsModule } from './uploads/uploads.module';
import { ReturnRequestsModule } from './return-requests/return-requests.module';
import { WastePostsModule } from './waste-posts/waste-posts.module';
import { SchemaPatchService } from './database/schema-patch.service';
import { WarehouseModule } from './warehouse/warehouse.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://root:root@db:5432/appdb?schema=public',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    CollectionPointsModule,
    RecyclingRequestsModule,
    ReturnRequestsModule,
    UploadsModule,
    WarehouseModule,
    WastePostsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SchemaPatchService],
})
export class AppModule {}
