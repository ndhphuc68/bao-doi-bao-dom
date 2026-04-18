import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { CollectionPoint } from '../collection-points/collection-point.entity';
import { RecyclingRequest } from '../recycling-requests/recycling-request.entity';
import { ReturnRequest } from '../return-requests/return-request.entity';
import { User } from '../users/user.entity';
import { collectionPointsSeed, type Seed } from './seeds/collection-points.seed';

const seeds: Seed[] = [collectionPointsSeed];

async function run() {
  const onlySeedName = process.argv[2];

  const url =
    process.env.DATABASE_URL ||
    'postgresql://root:root@db:5432/appdb?schema=public';

  const ds = new DataSource({
    type: 'postgres',
    url,
    entities: [User, CollectionPoint, RecyclingRequest, ReturnRequest],
    synchronize: true,
  });

  await ds.initialize();
  try {
    const runnable = onlySeedName
      ? seeds.filter((s) => s.name === onlySeedName)
      : seeds;

    if (onlySeedName && runnable.length === 0) {
      throw new Error(
        `Unknown seed "${onlySeedName}". Available: ${seeds
          .map((s) => s.name)
          .join(', ')}`,
      );
    }

    for (const seed of runnable) {
      // eslint-disable-next-line no-console
      console.log(`==> Seeding: ${seed.name}`);
      await seed.run(ds);
    }
  } finally {
    await ds.destroy();
  }
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

