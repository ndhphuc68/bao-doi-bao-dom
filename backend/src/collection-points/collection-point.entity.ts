import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('collection_points')
export class CollectionPoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @Column({ nullable: true })
  openHours: string;

  @Column({ nullable: true })
  distanceText: string; // Fake distance for demo UI
}
