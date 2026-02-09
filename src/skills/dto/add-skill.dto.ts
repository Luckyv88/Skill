export class AddSkillDto {
  haveSkills: {
    name: string;
    experience: number;
    projects: string;
  }[];

  wantSkills: string[];
}
