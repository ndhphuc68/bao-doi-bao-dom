import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole, User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['collectionPoint'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['collectionPoint'],
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['collectionPoint'],
    });
  }

  async listStoreAdmins(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: UserRole.STORE_ADMIN },
      order: { createdAt: 'DESC' },
      relations: ['collectionPoint'],
    });
  }

  async createStoreAdmin(data: {
    email: string;
    password: string;
    name: string;
    collectionPointId: string;
  }): Promise<User> {
    const email = data.email.trim().toLowerCase();
    const existing = await this.findOneByEmail(email);
    if (existing) throw new ConflictException('Email already exists');
    const hashed = await bcrypt.hash(data.password, 10);
    const created = await this.create({
      email,
      password: hashed,
      name: data.name.trim(),
      collectionPointId: data.collectionPointId,
      role: UserRole.STORE_ADMIN,
      points: 0,
    });
    const { password: _p, ...rest } = created;
    return rest as Omit<User, 'password'>;
  }

  async updateAdminUser(
    id: string,
    patch: Partial<Pick<User, 'collectionPointId' | 'role' | 'name'>>,
  ): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, patch);
    return this.save(user);
  }

  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async addPoints(userId: string, points: number): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new Error('User not found');
    user.points += points;
    return this.usersRepository.save(user);
  }
}
