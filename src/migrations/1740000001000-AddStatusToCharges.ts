import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToCharges1740000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `charges` ADD COLUMN `status` ENUM('paid','pending') NOT NULL DEFAULT 'pending'"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `charges` DROP COLUMN `status`"
    );
  }
}
