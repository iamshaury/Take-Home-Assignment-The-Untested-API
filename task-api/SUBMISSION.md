# Take-Home Assignment Submission

## Bug Report

Hey! While writing the tests and digging into the code, I noticed a couple of issues:

### 1. The `update` route allows overwriting immutable fields
**Expected:** People should only be able to update safe fields like `title`, `description`, `status`, etc., but never internal values like the `id`.
**Actual:** `req.body` is spread directly into the task object. So, you could send a PUT request with `{"id": "fake-id", "createdAt": "1999"}` and it would actually overwrite those system values.
**How I found it:** I noticed `const updated = { ...tasks[index], ...fields };` in `taskService.js`.
**The Fix:** I went ahead and fixed this one. I modified the service so it explicitly picks out only the mutable fields and ignores everything else.

### 2. Pagination `page` parameter might be off-by-one
**Expected:** Usually, grabbing `/tasks?page=1&limit=10` means you want the very first page of results (items 0-9).
**Actual:** The logic does `const offset = page * limit;`. So if `page=1`, the offset is 10, meaning the first 10 tasks are skipped entirely. It assumes 0-indexed pages.
**How I found it:** Looking at the `getPaginated` math.
**The Fix:** We probably just need to align on a convention. If we want 1-based paging, the fix is `const offset = (page > 0 ? page - 1 : 0) * limit;`. I left it as-is for now so I didn't break any existing client assumptions.

---

## Final Notes

Here are some thoughts to wrap things up!

### What I'd test next
If I had more time, I'd definitely throw some boundary tests at the `/tasks` pagination (what happens if someone asks for `page=-5` or a limit of 1,000,000?). I'd also play around with weird date formats in the `getStats` logic, and maybe try submitting a massive 20MB payload to see if the server chokes.

### Surprises in the codebase
The main surprise was how `PUT /tasks/:id` was blindly spreading every field from `req.body` into our task object. It's a classic JS vulnerability that lets anyone override their `id` or creation timestamps. I thought that was pretty critical, so that's the bug I chose to fix!
(Also noted that we don't have a catch-all 404 handler for random URLs, so Express just spits out its default HTML "Cannot GET /xyz" page).

### Questions before shipping to production
1. **Persistence:** Obviously, the in-memory array wipes itself on every restart. What database are we planning to move this to?
2. **Authentication / Ownership:** Right now anyone can update or delete anybody else's task. How are we handling user auth and authorization checks?
3. **Pagination Standard:** Do we want to treat `page=1` as the first page? Right now `page=1` skips the first 10 items because it expects `page` to be 0-indexed.
4. **Soft Deletes:** Are we cool with hard-deleting tasks, or do we want to flip an `isDeleted` flag so users can recover them?
