const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Task API Routes', () => {
    beforeEach(() => {
        taskService._reset();
    });

    // Happy Path 1
    it('should list all tasks', async () => {
        const res = await request(app).get('/tasks');
        expect(res.status).toBe(200);
    });

    // Happy Path 2
    it('should create a task', async () => {
        const res = await request(app).post('/tasks').send({ title: 'New task' });
        expect(res.status).toBe(201);
    });

    // Happy Path 3
    it('should update a task', async () => {
        const task = taskService.create({ title: 'T1' });
        const res = await request(app).put(`/tasks/${task.id}`).send({ title: 'T2' });
        expect(res.status).toBe(200);
    });

    // Happy Path 4
    it('should complete a task', async () => {
        const task = taskService.create({ title: 'T1' });
        const res = await request(app).patch(`/tasks/${task.id}/complete`);
        expect(res.status).toBe(200);
    });

    // Happy Path 5
    it('should delete a task', async () => {
        const task = taskService.create({ title: 'T1' });
        const res = await request(app).delete(`/tasks/${task.id}`);
        expect(res.status).toBe(204);
    });

    // Happy Path 6
    it('should get stats', async () => {
        const res = await request(app).get('/tasks/stats');
        expect(res.status).toBe(200);
    });

    // Edge Case 1: Bad data on create (400)
    it('should fail to create a task without title', async () => {
        const res = await request(app).post('/tasks').send({});
        expect(res.status).toBe(400);
    });

    // Edge Case 2: Update non-existent task (404)
    it('should fail to update non-existent task', async () => {
        const res = await request(app).put('/tasks/fake').send({ title: 'New' });
        expect(res.status).toBe(404);
    });

    // Happy Path 7: Assign user
    it('should assign a task', async () => {
        const task = taskService.create({ title: 'T1' });
        const res = await request(app).patch(`/tasks/${task.id}/assign`).send({ assignee: 'Alice' });
        expect(res.status).toBe(200);
        expect(res.body.assignee).toBe('Alice');
    });

    // Edge Case 3: Assign invalid user
    it('should fail to assign with invalid assignee', async () => {
        const task = taskService.create({ title: 'T1' });
        const res = await request(app).patch(`/tasks/${task.id}/assign`).send({ assignee: '' });
        expect(res.status).toBe(400);
    });
});
