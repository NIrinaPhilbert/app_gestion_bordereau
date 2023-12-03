<?php

namespace App\Entity;

use App\Repository\DetailsBordereauRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=DetailsBordereauRepository::class)
 */
class DetailsBordereau
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity=Bordereau::class)
     * @ORM\JoinColumn(nullable=false)
     */
    private $bordereau;

    /**
     * @ORM\ManyToOne(targetEntity=Family::class)
     * @ORM\JoinColumn(nullable=false)
     */
    private $family;

    /**
     * @ORM\Column(type="float")
     */
    private $hasina;

    /**
     * @ORM\Column(type="integer")
     */
    private $taonaHasina;

    /**
     * @ORM\Column(type="float")
     */
    private $seminera;

    /**
     * @ORM\Column(type="integer")
     */
    private $taonaSeminera;

    /**
     * @ORM\Column(type="float")
     */
    private $diosezy;

    /**
     * @ORM\Column(type="integer")
     */
    private $taonaDiosezy;

    /**
     * @ORM\Column(type="integer")
     */
    private $ligne;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getBordereau(): ?Bordereau
    {
        return $this->bordereau;
    }

    public function setBordereau(?Bordereau $bordereau): self
    {
        $this->bordereau = $bordereau;

        return $this;
    }

    public function getFamily(): ?Family
    {
        return $this->family;
    }

    public function setFamily(?Family $family): self
    {
        $this->family = $family;

        return $this;
    }

    public function getHasina(): ?float
    {
        return $this->hasina;
    }

    public function setHasina(float $hasina): self
    {
        $this->hasina = $hasina;

        return $this;
    }

    public function getTaonaHasina(): ?int
    {
        return $this->taonaHasina;
    }

    public function setTaonaHasina(int $taonaHasina): self
    {
        $this->taonaHasina = $taonaHasina;

        return $this;
    }

    public function getSeminera(): ?float
    {
        return $this->seminera;
    }

    public function setSeminera(float $seminera): self
    {
        $this->seminera = $seminera;

        return $this;
    }

    public function getTaonaSeminera(): ?int
    {
        return $this->taonaSeminera;
    }

    public function setTaonaSeminera(int $taonaSeminera): self
    {
        $this->taonaSeminera = $taonaSeminera;

        return $this;
    }

    public function getDiosezy(): ?float
    {
        return $this->diosezy;
    }

    public function setDiosezy(float $diosezy): self
    {
        $this->diosezy = $diosezy;

        return $this;
    }

    public function getTaonaDiosezy(): ?int
    {
        return $this->taonaDiosezy;
    }

    public function setTaonaDiosezy(int $taonaDiosezy): self
    {
        $this->taonaDiosezy = $taonaDiosezy;

        return $this;
    }

    public function getLigne(): ?int
    {
        return $this->ligne;
    }

    public function setLigne(int $ligne): self
    {
        $this->ligne = $ligne;

        return $this;
    }
}
