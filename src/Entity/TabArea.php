<?php
declare(strict_types=1);
namespace App\Entity;

use App\Repository\TabAreaRepository;
use App\Traits\TimestampTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Doctrine\UuidGenerator;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Attribute\MaxDepth;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\NotNull;

#[ORM\Entity(repositoryClass: TabAreaRepository::class)]
#[ORM\Table(name: 'tab_areas')]
#[ORM\HasLifecycleCallbacks]
#[UniqueEntity(['designation'])]
class TabArea
{
    use TimestampTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "CUSTOM")]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[ORM\Column(type: "uuid", unique: true)]
    #[Groups(['tabArea:datatable', 'tabArea:item', 'tabArea:dropdown', 'tabArea:minimal'])]
    private ?string $id = null;

    #[ORM\Column(length: 255)]
    #[NotNull, NotBlank]
    #[Groups(['tabArea:datatable', 'tabArea:dashboard', 'tabArea:item', 'tabArea:dropdown', 'tabArea:minimal'])]
    private ?string $designation = null;

    #[ORM\Column]
    #[NotNull, NotBlank]
    #[Groups(['tabArea:datatable', 'tabArea:dashboard', 'tabArea:item', 'tabArea:minimal'])]
    private ?int $sorting = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['tabArea:datatable', 'tabArea:item'])]
    private ?string $comment = null;

    #[ORM\OneToMany(mappedBy: 'tabArea', targetEntity: BookmarkCategory::class)]
    #[Groups(['tabArea:datatable', 'tabArea:dashboard', 'tabArea:item'])]
    #[MaxDepth(1)]
    private Collection $bookmarkCategories;

    #[ORM\OneToMany(mappedBy: 'tabArea', targetEntity: Bookmark::class)]
    #[Groups(['tabArea:datatable', 'tabArea:dashboard'])]
    #[MaxDepth(1)]
    private Collection $bookmarks;

    public function __construct()
    {
        $this->bookmarkCategories = new ArrayCollection();
        $this->bookmarks = new ArrayCollection();
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getDesignation(): ?string
    {
        return $this->designation;
    }

    public function setDesignation(string $designation): static
    {
        $this->designation = $designation;

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

    public function addBookmarkCategory(BookmarkCategory $bookmarkCategory): static
    {
        if (!$this->bookmarkCategories->contains($bookmarkCategory)) {
            $this->bookmarkCategories->add($bookmarkCategory);
            $bookmarkCategory->setTabArea($this);
        }

        return $this;
    }

    public function removeBookmarkCategory(BookmarkCategory $bookmarkCategory): static
    {
        if ($this->bookmarkCategories->removeElement($bookmarkCategory)) {
            // set the owning side to null (unless already changed)
            if ($bookmarkCategory->getTabArea() === $this) {
                $bookmarkCategory->setTabArea(null);
            }
        }

        return $this;
    }

    public function addBookmark(Bookmark $bookmark): static
    {
        if (!$this->bookmarks->contains($bookmark)) {
            $this->bookmarks->add($bookmark);
            $bookmark->setTabArea($this);
        }

        return $this;
    }

    public function removeBookmark(Bookmark $bookmark): static
    {
        if ($this->bookmarks->removeElement($bookmark)) {
            // set the owning side to null (unless already changed)
            if ($bookmark->getTabArea() === $this) {
                $bookmark->setTabArea(null);
            }
        }

        return $this;
    }

    public function hasRelations(): bool
    {
        return (bool)count($this->getBookmarks()) > 0 && count($this->getBookmarkCategories()) > 0;
    }

    /**
     * @return Collection<int, Bookmark>
     */
    public function getBookmarks(): Collection
    {
        return $this->bookmarks;
    }

    /**
     * @return Collection<int, BookmarkCategory>
     */
    public function getBookmarkCategories(): Collection
    {
        return $this->bookmarkCategories;
    }
}
