import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedNotificationMotives1693848000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO notification_motives (id, motive, title, message)
      VALUES (
        UUID(),
        'transfer_received',
        'Você recebeu uma transferência',
        'Você recebeu uma transferência de {{origin_name}} no valor de {{transfer_value}}'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM notification_motives WHERE motive = 'transfer_received';
    `);
  }
}
