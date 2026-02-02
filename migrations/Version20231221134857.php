<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231221134857 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE bookmark_categories (id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', tab_area_id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', designation VARCHAR(255) NOT NULL, sorting INT NOT NULL, view_classes VARCHAR(255) DEFAULT NULL, comment VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_1CCCA4FEC5A92879 (tab_area_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE bookmark_categories ADD CONSTRAINT FK_1CCCA4FEC5A92879 FOREIGN KEY (tab_area_id) REFERENCES tab_areas (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE bookmark_categories DROP FOREIGN KEY FK_1CCCA4FEC5A92879');
        $this->addSql('DROP TABLE bookmark_categories');
    }
}
