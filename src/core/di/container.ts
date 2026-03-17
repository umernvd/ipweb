import { Client, Databases } from "appwrite";
import { CompanyAppwriteRepository } from "@/core/repositories/impl/CompanyAppwriteRepository";
import {
  RoleAppwriteRepository,
  LevelAppwriteRepository,
} from "@/core/repositories/impl/ConfigAppwriteRepository";
import { CandidateAppwriteRepository } from "@/core/repositories/impl/CandidateAppwriteRepository";
import { InterviewAppwriteRepository } from "@/core/repositories/impl/InterviewAppwriteRepository";
import { InterviewerAppwriteRepository } from "@/core/repositories/impl/InterviewerAppwriteRepository";
import { QuestionAppwriteRepository } from "@/core/repositories/impl/QuestionAppwriteRepository";
import { CompanyService } from "@/core/services/CompanyService";
import { RoleService, LevelService } from "@/core/services/ConfigService";
import { CandidateService } from "@/core/services/CandidateService";
import { AuthService } from "@/core/services/AuthService";
import { InterviewService } from "@/core/services/InterviewService";
import { InterviewerService } from "@/core/services/InterviewerService";
import { QuestionService } from "@/core/services/QuestionService";

// 1. Infrastructure
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("interviewpro");

const databases = new Databases(client);

// 2. Repositories
const companyRepo = new CompanyAppwriteRepository(databases);
const roleRepo = new RoleAppwriteRepository(databases);
const levelRepo = new LevelAppwriteRepository(databases);
const candidateRepo = new CandidateAppwriteRepository(databases);
const interviewRepo = new InterviewAppwriteRepository(
  client,
  "interview_pro_db",
);
const interviewerRepo = new InterviewerAppwriteRepository(
  databases,
  "interview_pro_db",
);
const questionRepo = new QuestionAppwriteRepository(
  databases,
  "interview_pro_db",
);

// 3. Services
const companyService = new CompanyService(companyRepo);
const roleService = new RoleService(roleRepo);
const levelService = new LevelService(levelRepo);
const candidateService = new CandidateService(candidateRepo);
const authService = new AuthService();
const interviewService = new InterviewService(interviewRepo);
const interviewerService = new InterviewerService(interviewerRepo);
const questionService = new QuestionService(questionRepo);

// 4. Export
export const DI = {
  companyService,
  roleService,
  levelService,
  candidateService,
  authService,
  interviewService,
  interviewerService,
  questionService,
};
