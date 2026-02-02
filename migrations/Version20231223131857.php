<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231223131857 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE bookmarks ADD tab_area_id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\'');
        $this->addSql('ALTER TABLE bookmarks ADD CONSTRAINT FK_78D2C140C5A92879 FOREIGN KEY (tab_area_id) REFERENCES tab_areas (id)');
        $this->addSql('CREATE INDEX IDX_78D2C140C5A92879 ON bookmarks (tab_area_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE bookmarks DROP FOREIGN KEY FK_78D2C140C5A92879');
        $this->addSql('DROP INDEX IDX_78D2C140C5A92879 ON bookmarks');
        $this->addSql('ALTER TABLE bookmarks DROP tab_area_id');
    }
}
