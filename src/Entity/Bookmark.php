<?php
declare(strict_types=1);
namespace App\Entity;

use App\Repository\BookmarkRepository;
use App\Traits\TimestampTrait;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Doctrine\UuidGenerator;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Attribute\MaxDepth;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\NotNull;

#[ORM\Entity(repositoryClass: BookmarkRepository::class)]
#[ORM\Table(name: 'bookmarks')]
#[ORM\HasLifecycleCallbacks]
#[UniqueEntity(['tabArea', 'bookmarkCategory', 'hyperlinkUrl', 'hyperlinkDescription'])]
class Bookmark
{
    use TimestampTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "CUSTOM")]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[ORM\Column(type: "uuid", unique: true)]
    #[Groups(['bookmark:datatable', 'bookmark:item', 'bookmark:dropdown', 'bookmark:minimal'])]
    private ?string $id = null;

    #[ORM\ManyToOne(inversedBy: 'bookmark')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['bookmark:datatable', 'bookmark:item'])]
    #[MaxDepth(2)]
    #[NotNull, NotBlank]
    private ?BookmarkCategory $bookmarkCategory = null;

    #[ORM\Column(length: 255)]
    #[Groups(['bookmark:datatable', 'bookmark:dashboard',  'bookmark:item', 'bookmark:dropdown', 'bookmark:minimal'])]
    #[NotNull, NotBlank]
    private ?string $hyperlinkUrl = null;

    #[ORM\Column(length: 255)]
    #[Groups(['bookmark:datatable', 'bookmark:dashboard',  'bookmark:item', 'bookmark:dropdown', 'bookmark:minimal'])]
    #[NotNull, NotBlank]
    private ?string $hyperlinkDescription = null;

    #[ORM\Column]
    #[Groups(['bookmark:datatable', 'bookmark:dashboard', 'bookmark:item', 'bookmark:minimal'])]
    #[NotNull, NotBlank]
    private ?int $sorting = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['bookmark:datatable', 'bookmark:item'])]
    private ?string $comment = null;

    #[ORM\ManyToOne(inversedBy: 'bookmark')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['bookmark:datatable', 'bookmark:item'])]
    #[MaxDepth(2)]
    #[NotNull, NotBlank]
    private ?TabArea $tabArea = null;

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getBookmarkCategory(): ?BookmarkCategory
    {
        return $this->bookmarkCategory;
    }

    public function setBookmarkCategory(?BookmarkCategory $bookmarkCategory): static
    {
        $this->bookmarkCategory = $bookmarkCategory;

        return $this;
    }

    public function getHyperlinkUrl(): ?string
    {
        return $this->hyperlinkUrl;
    }

    public function setHyperlinkUrl(string $hyperlinkUrl): static
    {
        $this->hyperlinkUrl = $hyperlinkUrl;

        return $this;
    }

    public function getHyperlinkDescription(): ?string
    {
        return $this->hyperlinkDescription;
    }

    public function setHyperlinkDescription(string $hyperlinkDescription): static
    {
        $this->hyperlinkDescription = $hyperlinkDescription;

        return $this;
    }

    public function getSorting(): ?int
    {
        return $this->sorting;
    }

    public function setSorting(int $sorting): static
    {
        $this->sorting = $sorting;

        return $this;
    }

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function setComment(?string $comment): static
    {
        $this->comment = $comment;

        return $this;
    }

    public function getTabArea(): ?TabArea
    {
        return $this->tabArea;
    }

    public function setTabArea(?TabArea $tabArea): static
    {
        $this->tabArea = $tabArea;

        return $this;
    }

    public function hasRelations(): bool
    {
        return  false;
    }
}
