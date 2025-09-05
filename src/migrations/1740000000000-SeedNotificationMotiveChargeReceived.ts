import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedNotificationMotiveChargeReceived1740000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO notification_motives (id, motive, title, message)
      VALUES (
        UUID(),
        'charge_received',
        'Você recebeu uma cobrança',
        'Você recebeu uma cobrança de {{origin_name}} no valor de {{charge_value}}'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM notification_motives WHERE motive = 'charge_received';
    `);
  }
}
