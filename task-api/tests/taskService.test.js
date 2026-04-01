const taskService = require('../src/services/taskService');

describe('Task Service', () => {
    beforeEach(() => taskService._reset());

    it('should create and get tasks', () => {
        taskService.create({ title: 'T1' });
        expect(taskService.getAll()).toHaveLength(1);
    });

    it('should update and remove tasks', () => {
        const t = taskService.create({ title: 'T1' });
        taskService.update(t.id, { title: 'T2' });
        expect(taskService.findById(t.id).title).toBe('T2');

        taskService.remove(t.id);
        expect(taskService.getAll()).toHaveLength(0);
    });

    it('should get by status and paginate', () => {
        taskService.create({ title: 'T1', status: 'done' });
        expect(taskService.getByStatus('done')).toHaveLength(1);
        expect(taskService.getPaginated(0, 1)).toHaveLength(1);
    });
});
