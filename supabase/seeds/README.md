# Database Seed System

This directory contains SQL seed files for local development and testing of the NCAT SaaS application.

## Overview

The seed system provides comprehensive test data for all major features, including realistic file sizes for storage quota testing, complete video generation pipelines, job monitoring, and AI chat history.

---

## Seed Files (Executed in Lexicographical Order)

| File | Description | Records |
|------|-------------|---------|
| **01_core_users.sql** | 5 test users with auth setup | 5 users, 5 identities, 5 profiles |
| **02_workspaces.sql** | Solo, team, and multi-workspace scenarios | 3 workspaces, 7 memberships |
| **03_story_types.sql** | Video generation templates | 5 story types (4 system, 1 custom) |
| **04_sample_stories.sql** | Complete stories with scenes and shots | 3 stories, 5 scenes, 2 shots |
| **05_sample_files.sql** | Sample media files with realistic sizes | 15 files (~14.5 GB total) |
| **06_sample_jobs.sql** | Job records in various states | 20 jobs (10 completed, 3 processing, 2 failed, 5 pending) |
| **07_ai_chat_history.sql** | Chat conversation history | 5 chat sessions, 25 messages |
| **08_billing_data.sql** | Stripe products, subscriptions, invoices | 3 products, 3 prices, 3 customers, 3 subscriptions |

---

## Test Credentials

### Users

| Email | Password | Role | Workspace(s) | Notes |
|-------|----------|------|--------------|-------|
| `admin@test.com` | `admin123` | admin | Admin's Workspace (owner)<br>Solo's Workspace (readonly)<br>Team Workspace (admin) | Multi-workspace access |
| `solo@test.com` | `solo123` | user | Solo's Personal Workspace (owner) | Free plan, near storage limit |
| `owner@team.com` | `team123` | user | Team Workspace (owner) | Pro plan |
| `member@team.com` | `team123` | user | Team Workspace (member) | Standard member |
| `readonly@team.com` | `team123` | user | Team Workspace (readonly) | Read-only access |

---

## Workspaces & Storage Quotas

### 1. Admin's Workspace
- **Owner**: admin@test.com
- **Plan**: Business ($50/month)
- **Storage Quota**: 50 GB
- **Usage**: 522 MB (1%) ✅ Plenty of space
- **Files**: 2 test files

### 2. Solo's Personal Workspace
- **Owner**: solo@test.com
- **Plan**: Free ($0/month)
- **Storage Quota**: 10 GB
- **Usage**: 9.75 GB (97.5%) ⚠️ **NEAR LIMIT**
- **Files**: 5 large files (3x 3GB videos, 2x audio files)
- **Purpose**: Test storage quota warnings and upgrade prompts

### 3. Team Collaboration Workspace
- **Owner**: owner@team.com
- **Members**: member@team.com (member), readonly@team.com (readonly), admin@test.com (admin)
- **Plan**: Pro ($25/month)
- **Storage Quota**: 25 GB
- **Usage**: 4.2 GB (16.8%) ✅ Comfortable
- **Files**: 5 files + 3 real DigitalOcean images

---

## Storage Quota Testing Scenarios

### Near Limit Warning (Solo User)
```
Total: 9.75 GB / 10 GB (97.5%)
Files:
- my-vacation-video-part1.mp4 (3 GB)
- my-vacation-video-part2.mp4 (3 GB)
- project-final-render.mp4 (3 GB)
- podcast-episode-01.mp3 (512 MB)
- background-music-collection.mp3 (256 MB)
```

**Tests**:
- ⚠️ Red/yellow quota indicators
- 🚫 Upload blocking when exceeding quota
- 💰 Upgrade prompts displayed
- 📊 Storage usage charts

### Comfortable Usage (Team)
```
Total: 4.2 GB / 25 GB (16.8%)
Files:
- team-presentation-2024.mp4 (1 GB)
- product-demo-v3.mp4 (1 GB)
- conference-keynote-recording.mp4 (2 GB)
- team-meeting-audio-notes.mp3 (100 MB)
- voiceover-final-version.mp3 (100 MB)
```

**Tests**:
- ✅ Green quota indicators
- ✅ Normal file upload flow
- 📈 Accurate usage reporting

### Minimal Usage (Admin)
```
Total: 522 MB / 50 GB (1%)
Files:
- system-test-video.mp4 (512 MB)
- system-test-image.png (10 MB)
```

**Tests**:
- ✅ Enterprise features enabled
- ✅ No restrictions
- 🎯 Plenty of headroom

---

## Video Generation Pipeline

### Story 1: "The Future of AI" (Completed)
- **User**: solo@test.com
- **Type**: Faceless YouTube Video (1920x1080)
- **Status**: Completed ✅
- **Assets**:
  - 1 scene ("Introduction to AI")
  - 2 shots (AI Brain Visual, Self-Driving Car)
  - All media generated (images, audio, video)
  - Final video with captions

**Tests**:
- Complete video generation workflow
- Asset URL management
- Shot sequencing
- Final output delivery

### Story 2: "Breaking News: Mars Colony" (In Progress)
- **User**: owner@team.com
- **Type**: Comic Book News (1080x1920)
- **Status**: In Progress ⏳
- **Assets**:
  - 2 scenes (Headline Reveal - completed, Colony Details - generating)
  - Partial asset generation
  - Active generation tracking

**Tests**:
- In-progress generation state
- Partial completion handling
- Generation resume capability

### Story 3: "Installing Docker" (Draft)
- **User**: solo@test.com
- **Type**: INSTALL HELPER (1080x1920)
- **Status**: Draft 📝
- **Assets**:
  - 2 planned scenes (Download, Run Installer)
  - No assets generated yet
  - Ready for workflow start

**Tests**:
- Draft/planning stage
- Scene planning without generation
- Workflow initialization

---

## Job Monitoring

### Completed Jobs (10)
- ✅ Video cut, trim, caption
- ✅ Audio transcription, concatenation
- ✅ Image-to-video conversion
- ✅ Agent-triggered jobs (linked to video generation)

### Processing Jobs (3)
- ⏳ Long video processing
- ⏳ Audio synthesis
- ⏳ Video rendering

### Failed Jobs (2)
- ❌ Invalid file format
- ❌ Processing timeout

### Pending Jobs (5)
- 📥 Queued for processing

**Tests**:
- Real-time job status updates
- Error message display
- Agent job tracking (entity_type, entity_id, entity_role)
- Job filtering and sorting

---

## AI Chat Sessions

| ID | User | Title | Messages | Model | Purpose |
|----|------|-------|----------|-------|---------|
| 1 | solo | Help me edit a video | 6 | gpt-4o | Multi-turn video editing guidance |
| 2 | owner | Generate captions | 4 | gpt-4o-mini | Caption customization |
| 3 | solo | Convert MP4 to MP3 | 2 | gpt-4o-mini | Quick conversion help |
| 4 | admin | Troubleshooting job failures | 8 | gpt-4o | Complex technical troubleshooting |
| 5 | member | Batch processing | 5 | gpt-4o-mini | Batch workflow guidance |

**Tests**:
- Chat history persistence
- Message rendering (user/assistant)
- Code blocks in responses
- Multi-turn conversations
- Real-world Q&A patterns

---

## Usage

### Reset and Re-seed Database

```bash
# Reset database and run all migrations + seeds
npx supabase db reset
```

This will:
1. ✅ Drop all existing data
2. ✅ Re-run all 33 migrations
3. ✅ Execute all seed files in order (01-08)
4. ✅ Create complete test environment

### Generate Snaplet AI Data (Optional)

```bash
# Navigate to supabase directory
cd supabase

# Install dependencies (first time only)
npm install

# Generate AI-enhanced seed data
npx tsx seed.ts > seeds/09_snaplet_generated.sql

# Reset database with new seed
cd ..
npx supabase db reset
```

**Requirements**:
- `OPENAI_API_KEY` in root `.env.local` file
- Snaplet dependencies installed (`npm install` in supabase/)

---

## Snaplet Configuration

Snaplet uses OpenAI for AI-enhanced realistic data generation.

### Setup

1. **Install dependencies**:
   ```bash
   cd supabase
   npm install
   ```

2. **Set OpenAI API Key**:
   - Open `.env.local` in project root
   - Add: `OPENAI_API_KEY=sk-...`

3. **Configure generation**:
   - Edit `seed.config.ts` to adjust tables/counts
   - Edit `seed.ts` to customize data patterns

4. **Generate SQL**:
   ```bash
   npx tsx seed.ts > seeds/09_snaplet_generated.sql
   ```

### What Snaplet Generates

- ✅ Realistic user names and emails
- ✅ Professional workspace descriptions
- ✅ Natural chat conversations
- ✅ Story/scene/shot narratives
- ✅ AI-generated image and video prompts
- ✅ Realistic file metadata

---

## File Organization

### Core Seed Files (01-08)
Hand-crafted SQL files with precise test data for specific scenarios.

- **Advantages**: Predictable, version-controlled, no API costs
- **When to use**: CI/CD, consistent testing, demo environments

### AI-Enhanced Seed (09 - Optional)
Generated via Snaplet with OpenAI for realistic variety.

- **Advantages**: More realistic, varied data, scales easily
- **When to use**: Load testing, UX testing, realistic demos

---

## Testing Scenarios

### 1. Solo Workspace (Free Plan)
**Login**: `solo@test.com` / `solo123`

**Test**:
- ⚠️ Storage quota warnings (97.5% used)
- 🚫 File upload blocking at limit
- 💰 Upgrade prompts and plan comparison
- 📊 Accurate storage usage display
- 🎬 Completed video story workflow
- 💬 AI chat history

### 2. Team Collaboration (Pro Plan)
**Login**: `owner@team.com`, `member@team.com`, or `readonly@team.com`

**Test**:
- 👥 Multi-user workspace
- 🔐 Role-based permissions (owner/member/readonly)
- ✅ Comfortable storage (16.8% used)
- 📁 Shared files across team
- 🎬 In-progress video generation
- 💬 Team chat interactions

### 3. Multi-Workspace Admin
**Login**: `admin@test.com` / `admin123`

**Test**:
- 🔄 Workspace switching (3 workspaces)
- 👑 Admin role in Team workspace
- 👀 Readonly access to Solo workspace
- 🏢 Business plan features (50 GB quota)
- 🛠️ System troubleshooting tools
- 📊 Admin analytics and monitoring

### 4. Billing & Subscriptions
**Test across all users**:
- 💳 Free Plan ($0/month, 10 GB)
- 💎 Pro Plan ($25/month, 25 GB)
- 🏆 Business Plan ($50/month, 50 GB)
- 📄 Invoice history
- 🔄 Subscription management
- 💳 Billing portal access

### 5. Video Generation Pipeline
**Test with Solo or Team Owner**:
- 📝 Draft stories (planning stage)
- ⏳ In-progress stories (partial generation)
- ✅ Completed stories (full pipeline)
- 🎬 Scenes and shots breakdown
- 🖼️ AI-generated images (DALL-E prompts)
- 🎙️ Voiceover generation (ElevenLabs)
- 🎥 Video animation (image-to-video)
- 📊 Generation time tracking

### 6. Job Monitoring
**Test across all users**:
- ✅ Completed jobs with results
- ⏳ Processing jobs (real-time updates)
- ❌ Failed jobs with error messages
- 📥 Pending jobs (queue management)
- 🤖 Agent-triggered jobs
- 🔗 Entity relationship tracking

### 7. AI Chat Interface
**Test across all users**:
- 💬 Multi-turn conversations
- 🔍 Chat history browsing
- 💾 Message persistence
- 🤖 Different AI models (GPT-4o, GPT-4o-mini)
- 📝 Code blocks in responses
- 🎯 Context-aware responses

---

## Troubleshooting

### Issue: Seed fails with foreign key constraint errors

**Solution**:
```bash
# Ensure migrations are current
npx supabase db reset
```

Seed files depend on migrations being complete. Always reset fully.

### Issue: Storage quota not calculating correctly

**Solution**:
```sql
-- Verify file sizes in database
SELECT
  user_id,
  COUNT(*) as file_count,
  SUM(file_size) as total_bytes,
  SUM(file_size) / 1024 / 1024 / 1024 as total_gb
FROM files
GROUP BY user_id;

-- Should show:
-- Solo: ~9.75 GB
-- Team: ~4.2 GB
-- Admin: ~0.5 GB
```

### Issue: Snaplet generation fails

**Solution**:
```bash
# Check OpenAI API key
echo $OPENAI_API_KEY

# Verify key in .env.local
cat .env.local | grep OPENAI_API_KEY

# Test Snaplet independently
cd supabase
npx tsx seed.ts
```

### Issue: Users can't log in

**Solution**:
- Passwords are bcrypt hashed
- Correct passwords:
  - Admin: `admin123`
  - Solo: `solo123`
  - Team: `team123` (all team members)

If login fails, check email confirmation:
```sql
SELECT email, email_confirmed_at FROM auth.users;
```

All seed users have `email_confirmed_at` set to NOW().

---

## Production Notes

⚠️ **IMPORTANT: These seeds are for LOCAL DEVELOPMENT ONLY!**

**Never use in production**:
- Weak passwords (admin123, solo123, team123)
- Fake Stripe IDs
- Test email addresses
- Predictable UUIDs

**For production deployment**:
1. ❌ DO NOT run these seed files
2. ✅ Use real Stripe webhooks to sync products
3. ✅ Let users create accounts via sign-up flow
4. ✅ Use strong, randomly generated credentials
5. ✅ Implement proper RBAC policies

---

## Development Workflow

**Before starting development**:
```bash
# 1. Start NCAT API
npm run ncat:start

# 2. Start Supabase
npx supabase start

# 3. Reset database with seeds
npx supabase db reset

# 4. Start Edge Functions
npx supabase functions serve

# 5. Start Stripe webhook forwarding
stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook

# 6. Start dev server
npm run dev
```

**After making database changes**:
```bash
# Update TypeScript types
npm run update-types

# Reset database to test changes
npx supabase db reset
```

---

## Next Steps

After seeding:

1. **Login and explore**:
   - Try all test users
   - Switch between workspaces
   - Test role permissions

2. **Test storage quotas**:
   - Upload files as Solo user (near limit)
   - Verify warning messages
   - Test upgrade prompts

3. **Test video generation**:
   - View completed story ("The Future of AI")
   - Continue in-progress story ("Mars Colony")
   - Start new story from draft

4. **Test job monitoring**:
   - Submit new jobs via Media Tools
   - Watch real-time status updates
   - Test error handling (invalid files)

5. **Test AI chat**:
   - Start new chat conversations
   - Browse chat history
   - Test different AI models

6. **Customize seeds** (optional):
   - Add your own test users
   - Create custom story types
   - Generate more realistic data with Snaplet

---

## Support

- **Documentation**: See `CLAUDE.md` in project root
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs

**Common commands**:
- Reset database: `npx supabase db reset`
- Update types: `npm run update-types`
- Check Supabase status: `npx supabase status`
- View Supabase Studio: http://localhost:54323

---

**Happy Testing! 🚀**
