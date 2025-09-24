import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from "typeorm";

export class AddPixKeyToUsers1740000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add nullable column first to allow backfill (if not exists)
    const hasPayId = await queryRunner.hasColumn('users', 'payId');
    if (!hasPayId) {
      await queryRunner.addColumn('users', new TableColumn({
        name: 'payId',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }));
    }

  // Backfill existing rows: normalize from email when available
  await queryRunner.query("UPDATE `users` SET `payId` = LOWER(TRIM(`email`)) WHERE `payId` IS NULL OR `payId` = ''");

  // Fallback for rows without valid email: use id to guarantee uniqueness
  await queryRunner.query("UPDATE `users` SET `payId` = `id` WHERE `payId` IS NULL OR `payId` = ''");

    // Alter to NOT NULL
    await queryRunner.changeColumn('users', 'payId', new TableColumn({
      name: 'payId',
      type: 'varchar',
      length: '255',
      isNullable: false,
    }));

    // Create unique index (if not exists)
    const table = await queryRunner.getTable('users');
    const alreadyHasIndex = table?.indices?.some(i => i.name === 'IDX_users_payId_unique');
    if (!alreadyHasIndex) {
      await queryRunner.createIndex('users', new TableIndex({
        name: 'IDX_users_payId_unique',
        columnNames: ['payId'],
        isUnique: true,
      }));
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_users_payId_unique');
    await queryRunner.dropColumn('users', 'payId');
  }
}
