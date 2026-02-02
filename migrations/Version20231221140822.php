<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231221140822 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE bookmarks (id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', bookmark_category_id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', hyperlink_url VARCHAR(255) NOT NULL, hyperlink_description VARCHAR(255) NOT NULL, sorting INT NOT NULL, comment VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_78D2C140B0C9471 (bookmark_category_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE bookmarks ADD CONSTRAINT FK_78D2C140B0C9471 FOREIGN KEY (bookmark_category_id) REFERENCES bookmark_categories (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE bookmarks DROP FOREIGN KEY FK_78D2C140B0C9471');
        $this->addSql('DROP TABLE bookmarks');
    }
}
