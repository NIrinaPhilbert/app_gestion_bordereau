<?php

namespace App\Entity;

use App\Repository\BordereauRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=BordereauRepository::class)
 */
class Bordereau
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $number;

    /**
     * @ORM\Column(type="date")
     */
    private $daty;

    /**
     * @ORM\ManyToOne(targetEntity=Quartier::class)
     * @ORM\JoinColumn(nullable=false)
     */
    private $quartier;

    /**
     * @ORM\ManyToOne(targetEntity=UserPlatform::class)
     * @ORM\JoinColumn(nullable=false)
     */
    private $owner;

    /**
     * @ORM\ManyToOne(targetEntity=UserPlatform::class)
     */
    private $receiver;

    /**
     * @ORM\Column(type="boolean")
     */
    private $valid;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNumber(): ?string
    {
        return $this->number;
    }

    public function setNumber(string $number): self
    {
        $this->number = $number;

        return $this;
    }

    public function getDaty(): ?\DateTimeInterface
    {
        return $this->daty;
    }

    public function setDaty(\DateTimeInterface $daty): self
    {
        $this->daty = $daty;

        return $this;
    }

    public function getQuartier(): ?Quartier
    {
        return $this->quartier;
    }

    public function setQuartier(?Quartier $quartier): self
    {
        $this->quartier = $quartier;

        return $this;
    }

    public function getOwner(): ?UserPlatform
    {
        return $this->owner;
    }

    public function setOwner(?UserPlatform $owner): self
    {
        $this->owner = $owner;

        return $this;
    }

    public function getReceiver(): ?UserPlatform
    {
        return $this->receiver;
    }

    public function setReceiver(?UserPlatform $receiver): self
    {
        $this->receiver = $receiver;

        return $this;
    }

    public function isValid(): ?bool
    {
        return $this->valid;
    }

    public function setValid(bool $valid): self
    {
        $this->valid = $valid;

        return $this;
    }
}
