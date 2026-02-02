<?php

namespace App\Entity;

use App\Repository\BookmarkCategoryRepository;
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

#[ORM\Entity(repositoryClass: BookmarkCategoryRepository::class)]
#[ORM\Table(name: 'bookmark_categories')]
#[ORM\HasLifecycleCallbacks]
#[UniqueEntity(['tabArea', 'designation'])]
class BookmarkCategory
{
    use TimestampTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "CUSTOM")]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[ORM\Column(type: "uuid", unique: true)]
    #[Groups(['bookmarkCategory:datatable', 'bookmarkCategory:item', 'bookmarkCategory:dropdown', 'bookmarkCategory:minimal'])]
    private ?string $id = null;

    #[ORM\ManyToOne(inversedBy: 'bookmarkCategories')]
    #[ORM\JoinColumn(nullable: false)]
    #[MaxDepth(2)]
    #[Groups(['bookmarkCategory:datatable', 'bookmarkCategory:item'])]
    #[NotNull, NotBlank]
    private ?TabArea $tabArea = null;

    #[ORM\Column(length: 255)]
    #[Groups(['bookmarkCategory:datatable', 'bookmarkCategory:dashboard', 'bookmarkCategory:item', 'bookmarkCategory:dropdown', 'bookmarkCategory:minimal'])]
    #[NotNull, NotBlank]
    private ?string $designation = null;

    #[ORM\Column]
    #[Groups(['bookmarkCategory:datatable', 'bookmarkCategory:dashboard', 'bookmarkCategory:item', 'bookmarkCategory:minimal'])]
    #[NotNull, NotBlank]
    private ?int $sorting = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['bookmarkCategory:datatable', 'bookmarkCategory:item'])]
    private ?string $viewClasses = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['bookmarkCategory:datatable', 'bookmarkCategory:item'])]
    private ?string $comment = null;

    #[ORM\OneToMany(mappedBy: 'bookmarkCategory', targetEntity: Bookmark::class)]
    #[Groups(['bookmarkCategory:datatable', 'bookmarkCategory:dashboard'])]
    #[MaxDepth(2)]
    private Collection $bookmarks;

    public function __construct()
    {
        $this->bookmarks = new ArrayCollection();
    }

    public function getId(): ?string
    {
        return $this->id;
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

    public function getViewClasses(): ?string
    {
        return $this->viewClasses;
    }

    public function setViewClasses(?string $viewClasses): static
    {
        $this->viewClasses = $viewClasses;

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

    public function addBookmark(Bookmark $bookmark): static
    {
        if (!$this->bookmarks->contains($bookmark)) {
            $this->bookmarks->add($bookmark);
            $bookmark->setBookmarkCategory($this);
        }

        return $this;
    }

    public function removeBookmark(Bookmark $bookmark): static
    {
        if ($this->bookmarks->removeElement($bookmark)) {
            // set the owning side to null (unless already changed)
            if ($bookmark->getBookmarkCategory() === $this) {
                $bookmark->setBookmarkCategory(null);
            }
        }

        return $this;
    }

    public function hasRelations(): bool
    {
        return (bool)count($this->getBookmarks()) > 0;
    }

    // Eine Beispielmethode, um festzustellen, ob noch Relationen vorhanden sind

    /**
     * @return Collection<int, Bookmark>
     */
    public function getBookmarks(): Collection
    {
        return $this->bookmarks;
    }
}
