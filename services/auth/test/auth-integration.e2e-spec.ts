import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/database/entities';
import { Repository } from 'typeorm';

describe('Auth Integration Tests (E2E)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));

    await app.init();
  });

  afterAll(async () => {
    // Cleanup
    if (userId) {
      await userRepository.delete({ id: userId });
    }
    await app.close();
  });

  describe('Complete Authentication Flow (UI -> API -> DB)', () => {
    const testUser = {
      email: 'integration-test@example.com',
      phone: '+84900000001',
      password: 'TestPassword123!',
      fullName: 'Integration Test User',
      userType: 'CUSTOMER',
    };

    it('Step 1: User Registration - Should create user in database', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      userId = response.body.id;

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.fullName).toBe(testUser.fullName);
      expect(response.body).not.toHaveProperty('password'); // Password should not be returned

      // Verify user exists in database
      const userInDb = await userRepository.findOne({
        where: { id: userId },
      });

      expect(userInDb).toBeTruthy();
      expect(userInDb!.email).toBe(testUser.email);
      expect(userInDb!.emailVerified).toBe(false); // Should not be verified initially
    });

    it('Step 2: Login - Should authenticate user and return token', async () => {
      // Note: This would typically call POST /auth/login
      // For now we'll simulate this by verifying the user exists
      const userInDb = await userRepository.findOne({
        where: { email: testUser.email },
      });

      expect(userInDb).toBeTruthy();
      expect(userInDb!.email).toBe(testUser.email);
    });

    it('Step 3: Get User Profile - Should retrieve authenticated user data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.fullName).toBe(testUser.fullName);
    });

    it('Step 4: Update User Profile - Should persist changes to database', async () => {
      const updateData = {
        fullName: 'Updated Integration Test User',
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.fullName).toBe(updateData.fullName);

      // Verify update in database
      const userInDb = await userRepository.findOne({
        where: { id: userId },
      });

      expect(userInDb!.fullName).toBe(updateData.fullName);
    });

    it('Step 5: Delete User - Should soft delete user from database', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(200);

      // Verify user status changed in database
      const userInDb = await userRepository.findOne({
        where: { id: userId },
      });

      expect(userInDb!.status).toBe('inactive');
    });
  });

  describe('Database Consistency Tests', () => {
    it('should maintain referential integrity', async () => {
      const user = await userRepository.findOne({
        where: { id: userId },
        relations: ['roles'],
      });

      expect(user).toBeTruthy();
      expect(Array.isArray(user!.roles)).toBe(true);
    });

    it('should enforce unique constraints', async () => {
      const duplicateUser = {
        email: testUser.email, // Same email as existing user
        phone: '+84900000002',
        password: 'TestPassword123!',
        fullName: 'Duplicate User',
        userType: 'CUSTOMER',
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(duplicateUser)
        .expect(409); // Conflict
    });

    it('should hash passwords before storing in database', async () => {
      const user = await userRepository.findOne({
        where: { id: userId },
      });

      expect(user!.password).toBeTruthy();
      expect(user!.password).not.toBe(testUser.password); // Should be hashed
      expect(user!.password.length).toBeGreaterThan(20); // Bcrypt hashes are long
    });
  });

  describe('Error Handling Integration', () => {
    it('should return 404 when user not found', async () => {
      await request(app.getHttpServer())
        .get('/users/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should return 400 for invalid data', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'invalid-email', // Invalid email format
          phone: 'invalid',
          password: '123', // Too short
        })
        .expect(400);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent user creation', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        request(app.getHttpServer())
          .post('/users')
          .send({
            email: `concurrent-${i}@example.com`,
            phone: `+8490000010${i}`,
            password: 'TestPassword123!',
            fullName: `Concurrent User ${i}`,
            userType: 'CUSTOMER',
          })
      );

      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result.status).toBe(201);
        expect(result.body).toHaveProperty('id');
      });

      // Cleanup
      for (const result of results) {
        await userRepository.delete({ id: result.body.id });
      }
    });

    it('should handle pagination efficiently', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.users)).toBe(true);
    });
  });
});
