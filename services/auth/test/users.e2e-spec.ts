import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, Role } from '../src/database/entities';
import { Repository } from 'typeorm';

describe('Users E2E Tests', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    roleRepository = moduleFixture.get<Repository<Role>>(getRepositoryToken(Role));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await userRepository.query('DELETE FROM user_roles');
    await userRepository.delete({});
    await roleRepository.delete({});
  });

  describe('POST /users', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          phone: '+84987654321',
          password: 'Password123!',
          fullName: 'Test User',
          userType: 'CUSTOMER',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('test@example.com');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 409 if user already exists', async () => {
      const userData = {
        email: 'duplicate@example.com',
        phone: '+84987654322',
        password: 'Password123!',
        fullName: 'Duplicate User',
        userType: 'CUSTOMER',
      };

      // Create first user
      await request(app.getHttpServer()).post('/users').send(userData);

      // Try to create duplicate
      return request(app.getHttpServer())
        .post('/users')
        .send(userData)
        .expect(409);
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'invalid-email',
          // Missing required fields
        })
        .expect(400);
    });
  });

  describe('GET /users', () => {
    it('should return paginated users', async () => {
      // Create test users
      await request(app.getHttpServer()).post('/users').send({
        email: 'user1@example.com',
        phone: '+84987654321',
        password: 'Password123!',
        fullName: 'User 1',
        userType: 'CUSTOMER',
      });

      await request(app.getHttpServer()).post('/users').send({
        email: 'user2@example.com',
        phone: '+84987654322',
        password: 'Password123!',
        fullName: 'User 2',
        userType: 'CUSTOMER',
      });

      return request(app.getHttpServer())
        .get('/users?page=1&limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('users');
          expect(res.body).toHaveProperty('total');
          expect(res.body.users).toBeInstanceOf(Array);
          expect(res.body.total).toBeGreaterThanOrEqual(2);
        });
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'getuser@example.com',
          phone: '+84987654323',
          password: 'Password123!',
          fullName: 'Get User',
          userType: 'CUSTOMER',
        });

      const userId = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body.email).toBe('getuser@example.com');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'updateuser@example.com',
          phone: '+84987654324',
          password: 'Password123!',
          fullName: 'Update User',
          userType: 'CUSTOMER',
        });

      const userId = createResponse.body.id;

      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send({
          fullName: 'Updated Name',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.fullName).toBe('Updated Name');
        });
    });
  });

  describe('DELETE /users/:id', () => {
    it('should soft delete a user', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'deleteuser@example.com',
          phone: '+84987654325',
          password: 'Password123!',
          fullName: 'Delete User',
          userType: 'CUSTOMER',
        });

      const userId = createResponse.body.id;

      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(200);
    });
  });
});
